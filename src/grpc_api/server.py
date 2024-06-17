import grpc
from concurrent import futures
import os
import video__pb2
import video_pb2_grpc

SERVER_PORT = "3000"
CHUNK_SIZE = 1024
UPLOAD_DIR = "./media"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class VideoServiceServicer(video_pb2_grpc.VideoServiceServicer):
    def uploadVideo(self, request_iterator, context):
        filename = None
        temp_file_path = None

        for video_chunk in request_iterator:
            if not filename:
                filename = video_chunk.filename
                temp_file_path = os.path.join(UPLOAD_DIR, filename)
                print(f'Recibiendo el archivo: {filename}')
            with open(temp_file_path, 'ab') as f:
                f.write(video_chunk.data)
                print('.', end='', flush=True)

        return video__pb2.StreamVideoRequest(filename=filename)

    def streamVideo(self, request, context):
        file_path = os.path.join(UPLOAD_DIR, request.filename)
        with open(file_path, 'rb') as content_file:
            while chunk_bytes := content_file.read(chunk_size):
                yield video__pb2.VideoChunkResponse(data=chunk, filename=request.filename)
                print('.', end='', flush=True)

def serve():
    servicer = VideoServiceServicer()
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))

    video_pb2_grpc.add_VideoServiceServicer_to_server(servicer, server)
    server.add_insecure_port("[::]:" + SERVER_PORT)
    server.start()
    print("Servidor gRPC en ejecución en el puerto " + SERVER_PORT)
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        pass
    finally:
        server.stop(0)

if __name__ == "__main__":
    serve()
