package com.example.demo.controller;

import java.time.LocalDate;

public class InfoMsg 
{
	private LocalDate data;

	private String message;
	
	private Long userId; // Optional user ID for registration response

	public InfoMsg(LocalDate data, String message) {
		this.data = data;
		this.message = message;
	}
	
	public InfoMsg(LocalDate data, String message, Long userId) {
		this.data = data;
		this.message = message;
		this.userId = userId;
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
	
	public Long getUserId() {
		return userId;
	}
	
	public void setUserId(Long userId) {
		this.userId = userId;
	}
}

