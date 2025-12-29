
# Use an OpenJDK base image
FROM eclipse-temurin:17-jdk-jammy

#LABEL authors="DharmaTeja"
# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file into the container
COPY target/FinSightAuthServer.jar app.jar
# Expose the application port
EXPOSE 7000

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]