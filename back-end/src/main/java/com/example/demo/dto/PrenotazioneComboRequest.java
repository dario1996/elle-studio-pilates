package com.example.demo.dto;

import java.util.List;

public class PrenotazioneComboRequest {
    
    private Long venditaId;
    private List<CategoriaSelection> selezioni;

    public PrenotazioneComboRequest() {
    }

    public PrenotazioneComboRequest(Long venditaId, List<CategoriaSelection> selezioni) {
        this.venditaId = venditaId;
        this.selezioni = selezioni;
    }

    public Long getVenditaId() {
        return venditaId;
    }

    public void setVenditaId(Long venditaId) {
        this.venditaId = venditaId;
    }

    public List<CategoriaSelection> getSelezioni() {
        return selezioni;
    }

    public void setSelezioni(List<CategoriaSelection> selezioni) {
        this.selezioni = selezioni;
    }

    public static class CategoriaSelection {
        private String categoria;
        private Long templateId;
        private Integer numeroLezioni;

        public CategoriaSelection() {
        }

        public CategoriaSelection(String categoria, Long templateId, Integer numeroLezioni) {
            this.categoria = categoria;
            this.templateId = templateId;
            this.numeroLezioni = numeroLezioni;
        }

        public String getCategoria() {
            return categoria;
        }

        public void setCategoria(String categoria) {
            this.categoria = categoria;
        }

        public Long getTemplateId() {
            return templateId;
        }

        public void setTemplateId(Long templateId) {
            this.templateId = templateId;
        }

        public Integer getNumeroLezioni() {
            return numeroLezioni;
        }

        public void setNumeroLezioni(Integer numeroLezioni) {
            this.numeroLezioni = numeroLezioni;
        }
    }
}
