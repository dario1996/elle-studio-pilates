package com.example.demo.enums;

public enum TipoLezione {
    PRIVATA("Lezione Privata"),
    PRIMA_LEZIONE("Prima Lezione"),
    SEMI_PRIVATA_DUETTO("Semi-Privata Duetto"),
    SEMI_PRIVATA_GRUPPO("Semi-Privata Gruppo"),
    MATWORK("Matwork"),
    YOGA("Yoga");

    private final String label;

    TipoLezione(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
