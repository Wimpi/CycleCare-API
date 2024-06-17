# Imagen base de Python
FROM python:3.12.4

# Copiar los archivos necesarios
COPY . /app

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Opcional: instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3000

CMD ["python", "server.py"]