package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Status;
import com.ensa.achrafkarim.backend.mapper.SaleMapper;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import com.ensa.achrafkarim.backend.repository.UsersRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleServiceImpl implements SaleService {

    private final UsersRepository usersRepository;
    private SaleRepository saleRepository;
    private SaleMapper saleMapper;

    public SaleServiceImpl(SaleRepository saleRepository, SaleMapper saleMapper, UsersRepository usersRepository) {
        this.saleRepository = saleRepository;
        this.saleMapper = saleMapper;
        this.usersRepository = usersRepository;
    }

    @Override
    public SaleDto updateSaleStatus(Long saleId, Status newStatus) {
        Sale sale = saleRepository.findById(saleId).orElse(null);
        if (sale == null) return null; // if sale does not exist
        sale.setStatus(newStatus);
        Sale saleUpdated = saleRepository.save(sale);

        return saleMapper.toDto(saleUpdated);
    }

    @Override
    public SaleDto getSale(Long id) {
        Sale sale = saleRepository.findById(id).orElse(null);
        if (sale == null) return null;
        return saleMapper.toDto(sale);
    }

    @Override
    public List<SaleDto> listSales() {
        List<Sale> sales = saleRepository.findAll();
        List<SaleDto> saleDtos = sales.stream()
                .map(sale -> saleMapper.toDto(sale))
                .collect(Collectors.toList());
        return saleDtos;
    }

    @Override
    public List<SaleDto> getSalesByUser(Long userId) {
        List<Sale> sales = saleRepository.findByUsersId(userId);
        List<SaleDto> saleDtos = sales.stream()
                .map(sale -> saleMapper.toDto(sale))
                .collect(Collectors.toList());
        return saleDtos;
    }

    @Override
    public SaleDto createSale(SaleDto saleDto, Long userId) {
        Sale sale = saleMapper.toEntity(saleDto);
        sale.setUsers(usersRepository.findById(userId).get());
        sale.setDateOfSale(LocalDateTime.now());
        sale.setUpdatedAt(LocalDateTime.now());
        Sale savedSale = saleRepository.save(sale);
        return saleMapper.toDto(savedSale);
    }

    @Override
    public SaleDto updateSale(Long id, SaleDto saleDto) {
        return null;
    }

    @Override
    public void deleteSale(Long id) {
        if (saleRepository.findById(id) == null ) return;
        saleRepository.deleteById(id);
    }

    @Override
    public List<SaleDto> getSaleByStatus(Status status) {
        List<Sale> salesByStatus = saleRepository.findAllByStatus(status);
        return salesByStatus.stream()
                .map(sale ->  saleMapper.toDto(sale))
                .collect(Collectors.toList());
    }

}
