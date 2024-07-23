FROM ubuntu:latest
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    apt-get install -y dos2unix

WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

RUN dos2unix /app/testAlgo.sh
RUN dos2unix /app/test/input/*.csv
RUN dos2unix /app/test/output/*.csv

# Rendre le script testAlgo.sh exécutable
RUN chmod +x /app/testAlgo.sh

# Exécuter le script de test
CMD ["./testAlgo.sh"]
