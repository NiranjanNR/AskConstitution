import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
import ollama
import numpy as np
import argparse

class LargePDFAssistant:
    def __init__(self, pdf_path, chunk_size=1000):
        self.pdf_path = pdf_path
        self.chunk_size = chunk_size
        self.chunks, self.page_map = self._chunk_pdf()
        self.vectorizer = TfidfVectorizer()
        self.chunk_vectors = self._compute_vectors()

    def _chunk_pdf(self):
        doc = fitz.open(self.pdf_path)
        chunks = []
        page_map = []

        for page_num, page in enumerate(doc):
            text = page.get_text()
            # Split text into manageable chunks
            for i in range(0, len(text), self.chunk_size):
                chunk = text[i:i+self.chunk_size]
                chunks.append(chunk)
                page_map.append(page_num + 1)

        return chunks, page_map

    def _compute_vectors(self):
        return self.vectorizer.fit_transform(self.chunks)

    def find_relevant_chunks(self, query, top_k=3):
        query_vector = self.vectorizer.transform([query])
        similarities = np.dot(self.chunk_vectors, query_vector.T).toarray().flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        # Return chunks with their page numbers and similarity scores
        return [(self.chunks[idx], self.page_map[idx], similarities[idx]) 
                for idx in top_indices]

    def ask_question(self, question):
        relevant_chunks = self.find_relevant_chunks(question)
        
        # Prepare context with page numbers
        contexts = [
            f"Page {page_num}: {chunk}" 
            for chunk, page_num, _ in relevant_chunks
        ]
        full_context = "\n\n".join(contexts)
        
        response = ollama.chat(
            model='mistral',
            messages=[
                {'role': 'system', 'content': 'Answer question based strictly on provided context'},
                {'role': 'user', 'content': f"Context:\n{full_context}\n\nQuestion: {question}"}
            ]
        )
        
        return response['message']['content']

def main():
    parser = argparse.ArgumentParser(description='Ask a question about the PDF document.')
    parser.add_argument('pdf_path', type=str, help='Path to the PDF document')
    parser.add_argument('question', type=str, help='The question to ask about the document')
    args = parser.parse_args()

    assistant = LargePDFAssistant(args.pdf_path)
    answer = assistant.ask_question(args.question)
    print(answer)

if __name__ == "__main__":
    main()
