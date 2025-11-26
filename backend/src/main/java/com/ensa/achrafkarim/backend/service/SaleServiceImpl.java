package com.ensa.achrafkarim.backend.service;

import com.ensa.achrafkarim.backend.dto.SaleDto;
import com.ensa.achrafkarim.backend.entities.Sale;
import com.ensa.achrafkarim.backend.entities.Users;
import com.ensa.achrafkarim.backend.enums.Status;
import com.ensa.achrafkarim.backend.mapper.SaleMapper;
import com.ensa.achrafkarim.backend.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleServiceImpl implements SaleService {

    private SaleRepository saleRepository;
    private SaleMapper saleMapper;

    public SaleServiceImpl(SaleRepository saleRepository,  SaleMapper saleMapper) {
        this.saleRepository = saleRepository;
        this.saleMapper = saleMapper;
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
    public SaleDto createSale(SaleDto saleDto, Users users) {
        Sale sale = saleMapper.toEntity(saleDto);
        sale.setUsers(users);
        return null;
    }

    @Override
    public SaleDto updateSale(Long id, SaleDto saleDto) {
        return null;
    }

    @Override
    public void deleteSale(Long id) {

    }

    @Override
    public List<SaleDto> getSaleByStatus(Status status) {
        return List.of();
    }

}
