package com.ensa.achrafkarim.backend.service.csv;

import com.opencsv.bean.CsvToBean;
import com.opencsv.bean.CsvToBeanBuilder;
import com.opencsv.bean.StatefulBeanToCsv;
import com.opencsv.bean.StatefulBeanToCsvBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.util.List;

public abstract class AbstractCsvParser<D, E> implements CsvParserService<D, E> {

    protected abstract Class<D> getDtoClass();

    @Override
    public List<D> parseCsv(MultipartFile file) throws Exception {

        try (Reader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream())
        )) {
            CsvToBean<D> csvToBean = new CsvToBeanBuilder<D>(reader)
                    .withType(getDtoClass())
                    .withIgnoreLeadingWhiteSpace(true)
                    .withIgnoreEmptyLine(true)
                    .build();

            return csvToBean.parse();
        }
    }

    // the subclass will implement this
    protected abstract List<D> getAllDtos();

    @Override
    public byte[] exportCsv() throws Exception {

        List<D> dtos = getAllDtos();

        try (StringWriter writer = new StringWriter()){
            StatefulBeanToCsv<D> beanToCsv = new StatefulBeanToCsvBuilder<D>(writer)
                    .withApplyQuotesToAll(false)
                    .build();
            beanToCsv.write(dtos);
            return writer.toString().getBytes();
        }
    }
}