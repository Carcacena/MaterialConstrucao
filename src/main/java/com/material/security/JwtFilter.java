package com.material.security;

import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.material.service.BlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final BlacklistService blacklistService;

    // Injeção por construtor unificada
    public JwtFilter(JwtService jwtService, 
                     UserDetailsServiceImpl userDetailsService, 
                     BlacklistService blacklistService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.blacklistService = blacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");

        // Se não houver cabeçalho ou não começar com Bearer, segue o fluxo para o próximo filtro
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        try {
            // CORREÇÃO CRÍTICA: Se o token estiver na blacklist (Logout executado), barra imediatamente
            if (blacklistService.isBlacklisted(token)) {
                logger.warn("Tentativa de acesso com um token que já passou por Logout.");
                throw new RuntimeException("Token inválido por motivo de encerramento de sessão.");
            }

            String username = jwtService.extrairUsername(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.validarToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
            
            filterChain.doFilter(request, response);

        } catch (Exception e) {
            logger.error("Erro na validação do JWT: " + e.getMessage());
            
            // Retorno padronizado e limpo direto para a interface do Postman/Frontend
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\": \"Token inválido ou expirado. Por favor, faça login novamente.\"}");
        }
    }
}