# Imagen base de Python
FROM python:3.12.4

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios
COPY . /app

# Opcional: instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3000

CMD ["python", "server.py"]