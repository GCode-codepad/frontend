# Step 1: Build the React app
FROM node:14 as build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app/
COPY package-lock.json /app/
RUN npm install

# Copy the rest of the app source code
COPY . /app/

# Build the React app
RUN npm run build

# Step 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the React build output to the Nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to serve the app
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
