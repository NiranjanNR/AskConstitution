import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/BounceLoader';
import './App.css';

const QuestionForm = () => {
  const [question, setQuestion] = useState('');
  const [permaquestion, setPermaQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const textareaRef = useRef(null);

  useEffect(() => {
    // Resize the textarea when the content changes
    const resizeTextarea = () => {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set the new height based on content
    };

    resizeTextarea(); // Call resizeTextarea when content changes
  }, [question]); // Trigger useEffect when question changes

  // Handle the form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPermaQuestion(question);
    setLoading(true);
    setSubmitted(true);
    setError('');  // Clear any previous errors

    try {
      const response = await axios.post('http://localhost:3000/run-python-script', {
        question,
      });
      setResult(response.data.output); // Set the result from the API response
    } catch (err) {
      setError('An error occurred while fetching the answer');
      console.error(err);
    } finally {
      setLoading(false); // Hide the loading spinner after the request
    }
  };

  return (
    <div>
      <div className='text-[70px] font-bold flex justify-center'>
        ask your constitution
      </div>
      <div className='flex justify-center items-center h-[88vh]' style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <div className='w-[700px]'>
          {/* Display the result or error above the input field */}
          <div className='overflow-auto h-[70vh] py-2'>
            {submitted && <div className='text-right ml-auto mb-5 '><span className='bg-[#9bf3d14f] px-3 py-3 rounded-lg'>{permaquestion}</span></div>}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'left', marginBottom: '10px' }}>
                <ClipLoader color="#159d69" loading={loading} size={30} />
              </div>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {result && !loading && <div className='bg-slate-300/25 w-[500px] mb-5 px-6 py-3 rounded-lg text-left'>{result}</div>}
          </div>

          {/* Input and submit form */}
          <div className='flex justify-center mt-6'>
            <form onSubmit={handleSubmit} className='flex justify-center gap-6 w-[700px]'>
              <textarea
                ref={textareaRef}
                placeholder="Enter your question"
                value={question}
                className='border-4 border-black'
                onChange={(e) => setQuestion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  minHeight: '38px', // Minimum height
                  resize: 'none', // Disable manual resizing
                  fontSize: '16px',
                }}
              />
              <div className="button-borders mt-2">
                <button type='submit' className="primary-button">ASK</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
