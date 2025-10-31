package com.example.demo.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "sicurezza")
public class JwtConfig
{
	private String uri;
	private String refresh;
	private String header = "Authorization";
    private String prefix = "Bearer ";
	private int expiration;
	private int refreshExpiration;
	private String secret;
	private Boolean noexpiration;

	public String getUri() {
		return uri;
	}

	public void setUri(String uri) {
		this.uri = uri;
	}

	public String getRefresh() {
		return refresh;
	}

	public void setRefresh(String refresh) {
		this.refresh = refresh;
	}

	public String getHeader() {
		return header;
	}

	public void setHeader(String header) {
		this.header = header;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public int getExpiration() {
		return expiration;
	}

	public void setExpiration(int expiration) {
		this.expiration = expiration;
	}

	public int getRefreshExpiration() {
		return refreshExpiration;
	}

	public void setRefreshExpiration(int refreshExpiration) {
		this.refreshExpiration = refreshExpiration;
	}

	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
	}

	public Boolean getNoexpiration() {
		return noexpiration;
	}

	public void setNoexpiration(Boolean noexpiration) {
		this.noexpiration = noexpiration;
	}
}
