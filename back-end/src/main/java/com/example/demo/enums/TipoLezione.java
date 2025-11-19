package com.example.demo.enums;

public enum TipoLezione {
    PRIVATA("Lezione Privata"),
    PRIMA_LEZIONE("Prima Lezione"),
    SEMI_PRIVATA("Semi-Privata"),
    PILATES_MATWORK("Matwork"),
    YOGA("Yoga"),
    STUDIO_INTERMEDIO("Studio Intermedio"),
    REFORMER_INTERMEDIO("Reformer Intermedio"),
    STUDIO_POSTURALE("Studio Posturale");

    private final String label;

    TipoLezione(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
