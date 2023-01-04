import 'dotenv/config';

const checkEnv = (): void => {
  if (!process.env.PORT) {
    console.log('PORT in file .env is not set!');
    process.exit(1);
  }
};

checkEnv();
