import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "Agostino96!";
        String encodedPassword = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("Encoded: " + encodedPassword);
        
        // Verifica che l'encoding funzioni
        boolean matches = encoder.matches(password, encodedPassword);
        System.out.println("Verification: " + matches);
    }
}
