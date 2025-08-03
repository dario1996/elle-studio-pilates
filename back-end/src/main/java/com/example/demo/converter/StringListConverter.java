package com.example.demo.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    @Override
    public String convertToDatabaseColumn(List<String> list) {
        return list != null ? String.join(",", list) : "";
    }

    @Override
    public List<String> convertToEntityAttribute(String joined) {
        return (joined != null && !joined.isEmpty()) ? List.of(joined.split(",")) : List.of();
    }
}
