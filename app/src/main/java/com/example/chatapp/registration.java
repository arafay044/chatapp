package com.example.chatapp;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import de.hdodenhof.circleimageview.CircleImageView;

public class registration extends AppCompatActivity {

    TextView login_button;
    EditText rg_username, rg_email, rg_password, rg_confirm_password;
    Button rg_signup;
    CircleImageView rg_profileImg;

    FirebaseAuth auth;
    FirebaseDatabase database;
    String emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+";
    android.app.ProgressDialog progressDialog;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_registration);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        progressDialog = new ProgressDialog(this);
        progressDialog.setMessage("Please wait...");
        progressDialog.setCancelable(false);


        // Initialize Firebase
        auth = FirebaseAuth.getInstance();
        database = FirebaseDatabase.getInstance();

        // UI components
        login_button = findViewById(R.id.loginbutton);
        rg_username = findViewById(R.id.rgUsername);
        rg_email = findViewById(R.id.rgEmail);
        rg_password = findViewById(R.id.rgPassword);
        rg_confirm_password = findViewById(R.id.rgConfirmPassword);
        rg_signup = findViewById(R.id.signupbutton);

        // Go to login screen
        login_button.setOnClickListener(v -> {
            Intent intent = new Intent(registration.this, login.class);
            startActivity(intent);
            finish();
        });

        // Signup process
        rg_signup.setOnClickListener(v -> {
            String username = rg_username.getText().toString();
            String email = rg_email.getText().toString();
            String password = rg_password.getText().toString();
            String confirm_password = rg_confirm_password.getText().toString();
            String status = "Hey! I'm using this app.";

            if (TextUtils.isEmpty(username) || TextUtils.isEmpty(email) || TextUtils.isEmpty(password) || TextUtils.isEmpty(confirm_password)) {
                progressDialog.dismiss();
                Toast.makeText(registration.this, "All fields are required", Toast.LENGTH_SHORT).show();
            } else if (!email.matches(emailPattern)) {
                progressDialog.dismiss();
                Toast.makeText(registration.this, "Enter valid email address", Toast.LENGTH_SHORT).show();
            } else if (password.length() < 6) {
                progressDialog.dismiss();
                Toast.makeText(registration.this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show();
            } else if (!password.equals(confirm_password)) {
                progressDialog.dismiss();
                Toast.makeText(registration.this, "Passwords don't match", Toast.LENGTH_SHORT).show();
            } else {
                progressDialog.show();
                // Register user
                auth.createUserWithEmailAndPassword(email, password)
                        .addOnCompleteListener(task -> {
                            if (task.isSuccessful()) {
                                String id = task.getResult().getUser().getUid();

                                // Save user to database
                                Users user = new Users(email, username, id, "", status);
                                DatabaseReference reference = database.getReference().child("Users").child(id);
                                reference.setValue(user).addOnCompleteListener(task1 -> {
                                    if (task1.isSuccessful()) {
                                        Toast.makeText(registration.this, "User Registered Successfully", Toast.LENGTH_SHORT).show();
                                        Intent intent = new Intent(registration.this, MainActivity.class);
                                        startActivity(intent);
                                        finish();
                                    } else {
                                        Toast.makeText(registration.this, "Database Error: " + task1.getException().getMessage(), Toast.LENGTH_SHORT).show();
                                    }
                                });
                            } else {
                                Toast.makeText(registration.this, "Registration Failed: " + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
                            }
                        });
            }
        });
    }
}
