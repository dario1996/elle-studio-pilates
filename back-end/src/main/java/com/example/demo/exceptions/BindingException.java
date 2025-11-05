package com.example.demo.exceptions;

public class BindingException  extends Exception
{
 	private static final long serialVersionUID = -5198072630604345819L;
 	
 	private String messaggio;
	
	public BindingException()
	{
		super();
	}
	
	public BindingException(String messaggio)
	{
		super(messaggio);
		this.messaggio = messaggio;
	}

	public String getMessaggio() {
		return messaggio;
	}

	public void setMessaggio(String messaggio) {
		this.messaggio = messaggio;
	}

}
