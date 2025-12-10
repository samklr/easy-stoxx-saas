# Test Users Configuration

## Overview

The test user seeding system has been refactored to use YAML configuration instead of hard-coded values. This makes it easier to manage test users and customize them for different environments.

## Configuration File

Test users are now defined in: [src/main/resources/test-users.yml](src/main/resources/test-users.yml)

## File Structure

```yaml
users:
  - name: "User Full Name"
    email: "user@example.com"
    role: "ORG_OWNER" or "ORG_EMPLOYEE"
    pin: "12345"
    status: "ACTIVE" or "INACTIVE"
    description: "Optional description for documentation"
```

## Default Test Users

The system comes with 5 pre-configured test users:

| Name | Email | Role | PIN | Status | Description |
|------|-------|------|-----|--------|-------------|
| Gustave H. | gustave@grandbudapest.com | ORG_OWNER | 12345 | ACTIVE | Hotel owner and manager |
| Zero Moustafa | zero@grandbudapest.com | ORG_EMPLOYEE | 54321 | ACTIVE | Lobby boy and employee |
| Jane Chef | jane@grandbudapest.com | ORG_EMPLOYEE | 11111 | ACTIVE | Chef and kitchen staff |
| Mike Storage | mike@grandbudapest.com | ORG_EMPLOYEE | 22222 | INACTIVE | Inventory manager (inactive) |
| Anna Concierge | anna@grandbudapest.com | ORG_EMPLOYEE | 33333 | ACTIVE | Front desk staff |

## How It Works

### 1. Configuration Loading

The `TestUsersConfig` class loads the YAML file using Spring Boot's `@ConfigurationProperties`:

```java
@Configuration
@ConfigurationProperties(prefix = "")
@Data
public class TestUsersConfig {
    private List<TestUserData> users = new ArrayList<>();
}
```

### 2. Data Seeding

The `DataSeeder` class reads the configuration and creates users on startup:

```java
@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(TestUsersConfig.class)
@Slf4j
public class DataSeeder {
    private final UserRepository userRepository;
    private final TestUsersConfig testUsersConfig;

    @Bean
    CommandLineRunner seedDatabase() {
        // Creates users from YAML configuration
    }
}
```

### 3. Automatic Import

The YAML file is automatically imported in [application.yml](src/main/resources/application.yml):

```yaml
spring:
  config:
    import:
      - classpath:test-users.yml
```

## Seeding Behavior

- **Only runs when database is empty**: The seeder only creates users if `userRepository.count() == 0`
- **Skips existing databases**: If users already exist, seeding is skipped
- **Error handling**: If a user fails to create, the error is logged and seeding continues
- **Logging**: Each created user is logged with email, role, and description

## Customizing Test Users

### For Development

Edit [src/main/resources/test-users.yml](src/main/resources/test-users.yml) directly:

```yaml
users:
  - name: "Your Name"
    email: "you@example.com"
    role: "ORG_OWNER"
    pin: "99999"
    status: "ACTIVE"
    description: "Custom test user"
```

### For Different Environments

Create environment-specific files:

1. **Development**: `test-users.yml` (default)
2. **Staging**: `test-users-staging.yml`
3. **Production**: Don't include test users or use empty list

Update [application.yml](src/main/resources/application.yml) per environment:

```yaml
spring:
  config:
    import:
      - classpath:test-users-${spring.profiles.active}.yml
```

### Disabling Test User Seeding

To disable test user seeding entirely:

**Option 1**: Use an empty users list in YAML
```yaml
users: []
```

**Option 2**: Create a production profile without the import
```yaml
---
spring:
  config:
    activate:
      on-profile: prod
  # Don't import test-users.yml
```

**Option 3**: Comment out the CommandLineRunner bean
```java
// @Bean
// CommandLineRunner seedDatabase() { ... }
```

## Available Roles

- `ORG_OWNER`: Organization owner with full access
- `ORG_EMPLOYEE`: Regular employee with limited access

## Available Statuses

- `ACTIVE`: User can log in and use the system
- `INACTIVE`: User account is disabled

## Example: Adding a New Test User

1. Open [src/main/resources/test-users.yml](src/main/resources/test-users.yml)

2. Add a new user entry:
```yaml
users:
  # ... existing users ...

  - name: "Sarah Manager"
    email: "sarah@grandbudapest.com"
    role: "ORG_OWNER"
    pin: "44444"
    status: "ACTIVE"
    description: "Assistant manager"
```

3. Delete the database (to trigger seeding) or clear the users table:
```sql
DELETE FROM users;
```

4. Restart the application - the new user will be created

## Production Considerations

⚠️ **Important**: Test users should NOT be seeded in production!

### Recommended Approach for Production

1. **Disable seeding** in production profile:
```yaml
---
spring:
  config:
    activate:
      on-profile: prod
  # No test-users.yml import
```

2. **Use database migrations** (Flyway/Liquibase) for production data

3. **Create initial users** through API or admin interface

4. **Never commit real user data** to version control

## Security Considerations

- ✅ Test users are clearly marked with `@grandbudapest.com` domain
- ✅ PINs are simple for testing (12345, etc.)
- ⚠️ NEVER use these credentials in production
- ⚠️ NEVER commit real user emails or passwords to YAML
- ✅ Consider using environment variables for sensitive data

## Migration from Old System

### Before (Hard-coded)
```java
User owner = new User();
owner.setName("Gustave H.");
owner.setEmail("gustave@grandbudapest.com");
owner.setRole(UserRole.ORG_OWNER);
owner.setPin("12345");
owner.setStatus(UserStatus.ACTIVE);
userRepository.save(owner);
```

### After (YAML-based)
```yaml
users:
  - name: "Gustave H."
    email: "gustave@grandbudapest.com"
    role: "ORG_OWNER"
    pin: "12345"
    status: "ACTIVE"
    description: "Hotel owner and manager"
```

## Benefits

✅ **Maintainability**: Easy to add/remove/modify test users
✅ **No Recompilation**: Changes to YAML don't require rebuilding
✅ **Environment-Specific**: Different users for dev/staging/prod
✅ **Documentation**: Descriptions explain each user's purpose
✅ **Validation**: Spring Boot validates YAML structure
✅ **Centralized**: All test data in one place

## Troubleshooting

### Users Not Being Created

**Check logs for**:
```
Seeding database with test users from configuration...
```

**If you see**:
```
Database already contains X users. Skipping seed.
```
→ Clear the database or delete existing users

**If you see**:
```
No test users configured in test-users.yml
```
→ Check that `test-users.yml` exists and has correct structure

### Invalid Role or Status

**Error**:
```
Failed to create user: user@example.com - No enum constant ...
```

**Solution**: Ensure role is `ORG_OWNER` or `ORG_EMPLOYEE`, and status is `ACTIVE` or `INACTIVE`

### YAML Parsing Errors

**Error**:
```
Cannot deserialize value of type ...
```

**Solution**: Check YAML indentation (use spaces, not tabs)

## Testing the Configuration

Run the application and check logs:

```bash
# Build and run
./mvnw clean spring-boot:run

# Check logs for seeding output
tail -f logs/spring.log | grep "Created user"
```

Expected output:
```
Created user: gustave@grandbudapest.com (ORG_OWNER) - Hotel owner and manager
Created user: zero@grandbudapest.com (ORG_EMPLOYEE) - Lobby boy and employee
...
Database seeding completed. Created 5 out of 5 configured users.
```

## Files Modified

- ✅ [DataSeeder.java](src/main/java/com/hotelsaas/backend/config/DataSeeder.java) - Refactored to use YAML
- ✅ [TestUsersConfig.java](src/main/java/com/hotelsaas/backend/config/TestUsersConfig.java) - New configuration class
- ✅ [test-users.yml](src/main/resources/test-users.yml) - New test users configuration
- ✅ [application.yml](src/main/resources/application.yml) - Import test-users.yml

---

**Questions?** Check the code comments or Spring Boot's Configuration Properties documentation.
