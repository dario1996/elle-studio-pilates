package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sistema Gestione Formazione Aziendale API")
                        .description("REST API per la gestione della formazione aziendale. " +
                                "Permette di registrare dipendenti, creare corsi e gestire assegnazioni.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team di Sviluppo")
                                .email("development@azienda.com")
                                .url("https://www.azienda.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}