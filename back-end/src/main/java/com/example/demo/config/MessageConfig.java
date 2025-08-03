package com.example.demo.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.i18n.LocaleContextHolder;
//import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
 
@Configuration
public class MessageConfig 
{
	@Bean(name = "validator")
	LocalValidatorFactoryBean validator()
	{
		LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
		bean.setValidationMessageSource(messageSource());

		return bean;
	}
	
	@Bean
	LocaleResolver localeResolver()
	{
		SessionLocaleResolver sessionLocaleResolver = new SessionLocaleResolver();
		sessionLocaleResolver.setDefaultLocale(LocaleContextHolder.getLocale());
		//sessionLocaleResolver.setDefaultLocale(new Locale("it"));
			
		return sessionLocaleResolver;
	}

	@Bean
	MessageSource messageSource()
	{
		ResourceBundleMessageSource resource = new ResourceBundleMessageSource();
		resource.setBasename("messages");
		resource.setUseCodeAsDefaultMessage(true);

		return resource;
	}
}
