package com.example.demo.entity;

import java.io.Serializable;

public record JwtTokenResponse(String token) implements Serializable {

	private static final long serialVersionUID = 8317676219297719109L;
}
