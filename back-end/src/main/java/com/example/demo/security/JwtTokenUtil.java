package com.example.demo.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Log
public class JwtTokenUtil {

    private final JwtConfig jwtConfig;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.getSubject());
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.getExpiration());
    }

    public <T> T getClaimFromToken(String token, Function<io.jsonwebtoken.Claims, T> claimsResolver) {
        final var claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private io.jsonwebtoken.Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            log.warning("JWT parsing failed: " + e.getMessage());
            throw e;
        }
    }

    private boolean isTokenExpired(String token) {
        return getExpirationDateFromToken(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        claims.put("type", "ACCESS_TOKEN");
        return doGenerateToken(claims, userDetails.getUsername(), jwtConfig.getExpiration());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "REFRESH_TOKEN");
        return doGenerateToken(claims, userDetails.getUsername(), jwtConfig.getRefreshExpiration());
    }

    private String doGenerateToken(Map<String, Object> claims, String subject, int expiration) {
        final Date now = new Date();
        final Date expiryDate = new Date(now.getTime() + expiration * 1000L);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean validateRefreshToken(String token) {
        try {
            final var claims = getAllClaimsFromToken(token);
            final String tokenType = (String) claims.get("type");
            return "REFRESH_TOKEN".equals(tokenType) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String refreshToken(String refreshToken) {
        try {
            if (!validateRefreshToken(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            final String username = getUsernameFromToken(refreshToken);
            final var claims = getAllClaimsFromToken(refreshToken);
            
            Map<String, Object> newClaims = new HashMap<>();
            newClaims.put("authorities", claims.get("authorities"));
            newClaims.put("type", "ACCESS_TOKEN");
            
            return doGenerateToken(newClaims, username, jwtConfig.getExpiration());
        } catch (Exception e) {
            log.warning("Token refresh failed: " + e.getMessage());
            throw new RuntimeException("Token refresh failed", e);
        }
    }

    public String extendTokenIfNeeded(String token, UserDetails userDetails) {
        if (!validateToken(token, userDetails)) {
            return null;
        }

        try {
            final Date expiration = getExpirationDateFromToken(token);
            final Date now = new Date();
            final long timeUntilExpiration = expiration.getTime() - now.getTime();
            
            final long fifteenMinutes = 15 * 60 * 1000;
            if (timeUntilExpiration < fifteenMinutes) {
                log.info("Extending token for user: " + userDetails.getUsername());
                return generateToken(userDetails);
            }
        } catch (Exception e) {
            log.warning("Token extension check failed: " + e.getMessage());
        }
        
        return token;
    }
}
