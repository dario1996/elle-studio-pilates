package com.example.demo.controller;

import java.time.LocalDate;

public class InfoMsg 
{
	private LocalDate data;

	private String message;

	public InfoMsg(LocalDate data, String message) {
		this.data = data;
		this.message = message;
	}

	public LocalDate getData() {
		return data;
	}

	public void setData(LocalDate data) {
		this.data = data;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}

