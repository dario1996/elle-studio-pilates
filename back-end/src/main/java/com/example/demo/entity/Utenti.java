package com.example.demo.entity;

import java.util.List;

import com.example.demo.converter.StringListConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utenti")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Utenti
{
	@Id
	@Column(name = "username")
	private String username;
	
	@Column(name = "email")
	private String email;
	
	@Column(name = "password")
	private String password;
	
	@Column(name = "attivo")
	private String attivo = "Si";
	
	@Column(name = "ruoli")
    @Convert(converter = StringListConverter.class)
    private List<String> ruoli;
	
}
