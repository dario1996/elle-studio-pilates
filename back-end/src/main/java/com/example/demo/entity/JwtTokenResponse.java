package com.example.demo.entity;

import java.io.Serializable;

import lombok.Data;

@Data
public class JwtTokenResponse implements Serializable 
{

	private static final long serialVersionUID = 8317676219297719109L;

	private final String token;

}
