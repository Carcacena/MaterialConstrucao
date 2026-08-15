package com.material.security;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

   @Bean
    CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(List.of(
        "http://localhost:8080",
        "https://materialconstrucao-production.up.railway.app"
    ));

    configuration.setAllowedMethods(List.of(
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ));

    configuration.setAllowedHeaders(List.of(
        "Authorization",
        "Content-Type",
        "Cache-Control"
    ));

    configuration.setExposedHeaders(List.of(
        "Authorization"
    ));

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}
      
   @Bean 
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception { 
       return http 
           .csrf(csrf -> csrf.disable()) 
           .cors(Customizer.withDefaults()) 
           .authorizeHttpRequests(auth -> auth // 🌟 O PONTO DE ENCADEAMENTO FOI CORRIGIDO AQUI!
               .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
               .requestMatchers("/auth/**").permitAll() 
               .requestMatchers("/api/auth/**", "/public/**").permitAll() 
               
               // 1. Arquivos visuais liberados para o navegador desenhar a tela 
               .requestMatchers( 
                   "/", 
                   "/*.html", 
                   "/*.js", 
                   "/*.css", 
                   "/*.png", 
                   "/*.jpg", 
                   "/*.mp3", 
                   "/mp3/**", 
                   "/favicon.ico", 
                   "/error", 
                   "/componentes-js/**", // 🌟 ADICIONE ESTA LINHA AQUI!
                   "/componentes/**" 
                   
               ).permitAll() 
               
               
         
            // 🌟 1. PRIMEIRO: Abre a exceção pública para o PDF (Caminho específico)
               .requestMatchers("/carrinho/public/pedido/**").permitAll()

               // 🔒 2. DEPOIS: Bloqueia o restante do sistema e o resto do carrinho (Caminho geral)
               .requestMatchers("/admin/**", "/usuario/**").authenticated() 
               .requestMatchers("/produtos", "/produtos/**").authenticated() 
               .requestMatchers("/clientes", "/clientes/**").authenticated() 
               .requestMatchers("/carrinho", "/carrinho/**").authenticated() // 👈 Agora este só pega o que sobrar!
               .requestMatchers("/imprimeCarrinho/imprimeCarrinho/**").authenticated() 
            //   .requestMatchers("/fornecedores", "/fornecedores/**").authenticated() 
               
               
               .anyRequest().authenticated()
           		   
        		   ) 
           .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) 
           .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) 
           .build(); 
   }
   

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}