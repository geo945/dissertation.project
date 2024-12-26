# Setup Locally

1. Install packages ` npm install `

2. Create .env file following the .env.example

3. Setup MySQL database ` docker-compose up -d `

4. Start application ` npm run start `

# Check MySQL container

Run ` docker ps `

# Login into mysql docker container

Run ` docker exec -it mysql_container mysql -u REPLACE_USER_NAME -p `