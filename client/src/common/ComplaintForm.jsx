// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import { useUser } from '../contexts/UserContext';

// function ComplaintForm() {
//   const { register, handleSubmit, formState: { errors }, reset } = useForm();
//   const navigate = useNavigate();
//   const { currentUser } = useUser();
//   const [message, setMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   async function postComplaint(complaintObj) {
//     if (!currentUser) {
//       setMessage('Please log in to post a complaint.');
//       return;
//     }

//     setIsLoading(true);
//     setMessage('');

//     try {
//       const complaintData = {
//         title: complaintObj.title,
//         description: complaintObj.content,
//         category: complaintObj.category === 'other' ? complaintObj.other : complaintObj.category,
//         roomno: complaintObj.roomno || currentUser.roomNumber,
//         block: complaintObj.block || currentUser.block
//       };

//       const token = localStorage.getItem('authToken');
//       const response = await fetch(`http://localhost:4700/student-api/${currentUser.Id}/postcomplaint`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(complaintData)
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setMessage('Complaint posted successfully!');
//         reset();
//         setTimeout(() => {
//           navigate(`/student-profile/${currentUser.Id}`);
//         }, 2000);
//       } else {
//         setMessage(result.message || 'Failed to post complaint. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error posting complaint:', error);
//       setMessage('Network error. Please check your connection and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   if (!currentUser) {
//     return (
//       <div className="container">
//         <div className="row justify-content-center mt-5">
//           <div className="col-md-6">
//             <div className="alert alert-warning text-center">
//               <h4>Access Denied</h4>
//               <p>Please log in to post a complaint.</p>
//               <button 
//                 className="btn btn-primary"
//                 onClick={() => navigate('/signup')}
//               >
//                 Go to Login
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='container'>
//       <div className="row justify-content-center mt-5">
//         <div className="col-lg-8 col-md-8 col-sm-10">
//           <div className="card shadow">
//             <div className="card-title text-center border-bottom">
//               <h2 className="p-3" style={{ color: "goldenrod" }}>
//                 Write a Complaint
//               </h2>
//             </div>
//             <div className='card-body bg-light'>
//               <form onSubmit={handleSubmit(postComplaint)}>
//                 {/* Title */}
//                 <div className="mb-4">
//                   <label htmlFor="title" className="form-label">Title*</label>
//                   <input 
//                     type="text" 
//                     className='form-control' 
//                     id="title" 
//                     {...register("title", { 
//                       required: "Title is required",
//                       maxLength: { value: 100, message: "Title must be less than 100 characters" }
//                     })}
//                   />
//                   {errors.title && <p className="text-danger small">{errors.title.message}</p>}
//                 </div>

//                 {/* Description */}
//                 <div className='mb-4'>
//                   <label htmlFor="content" className='form-label'>Description*</label>
//                   <textarea 
//                     {...register("content", { 
//                       required: "Description is required",
//                       maxLength: { value: 500, message: "Description must be less than 500 characters" }
//                     })} 
//                     id="content" 
//                     className='form-control' 
//                     rows="4"
//                     placeholder="Describe your complaint in detail..."
//                   ></textarea>
//                   {errors.content && <p className="text-danger small">{errors.content.message}</p>}
//                 </div>

//                 {/* Category */}
//                 <div className='mb-4'>
//                   <label htmlFor="category" className="form-label">Select a category*</label>
//                   <select 
//                     {...register("category", { required: "Category is required" })} 
//                     id="category" 
//                     className="form-select"
//                   >
//                     <option value="">Select a category</option>
//                     <option value="Plumbing">Plumbing</option>
//                     <option value="Electricity">Electricity</option>
//                     <option value="Cleaning">Cleaning</option>
//                     <option value="Furniture">Furniture</option>
//                     <option value="Wifi">Wifi</option>
//                     <option value="other">Other</option>
//                   </select>
//                   {errors.category && <p className="text-danger small">{errors.category.message}</p>}
//                 </div>

//                 {/* Other category specification */}
//                 <div className="mb-4">
//                   <label htmlFor="other" className="form-label">If other, please specify</label>
//                   <input 
//                     type="text" 
//                     className='form-control' 
//                     id="other" 
//                     {...register("other")}
//                     placeholder="Specify the category"
//                   />
//                 </div>

//                 {/* Room Number */}
//                 <div className="mb-4">
//                   <label htmlFor="roomno" className="form-label">Room No</label>
//                   <input 
//                     type="number" 
//                     className='form-control' 
//                     id="roomno" 
//                     {...register("roomno")}
//                     defaultValue={currentUser.roomNumber}
//                     placeholder={`Current: ${currentUser.roomNumber || 'Not set'}`}
//                   />
//                 </div>

//                 {/* Block */}
//                 <div className="mb-4">
//                   <label htmlFor="block" className="form-label">Block</label>
//                   <input 
//                     type="text" 
//                     className='form-control' 
//                     id="block" 
//                     {...register("block")}
//                     defaultValue={currentUser.block}
//                     placeholder={`Current: ${currentUser.block || 'Not set'}`}
//                   />
//                 </div>

//                 {/* Submit Button */}
//                 <div className="text-end">
//                   <button 
//                     type="submit" 
//                     className="btn btn-success"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? 'Posting...' : 'Post Complaint'}
//                   </button>
//                 </div>
//               </form>

//               {/* Message display */}
//               {message && (
//                 <div className={`text-center mt-3 ${message.includes('successfully') ? 'text-success' : 'text-danger'}`}>
//                   {message}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ComplaintForm;


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function ComplaintForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const navigate = useNavigate();
  const { studentId } = useParams(); // Get studentId from URL params
  const { currentUser } = useUser();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Watch the category field to show/hide "other" input
  const watchCategory = watch("category", "");

  async function postComplaint(complaintObj) {
    if (!currentUser) {
      setMessage('Please log in to post a complaint.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const complaintData = {
        title: complaintObj.title,
        description: complaintObj.content,
        category: complaintObj.category === 'other' ? complaintObj.other : complaintObj.category,
        roomno: complaintObj.roomno || currentUser.roomNumber,
        block: complaintObj.block || currentUser.block
      };

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4700/student-api/${currentUser.Id}/postcomplaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Complaint posted successfully!');
        reset();
        setTimeout(() => {
          navigate(`/student-profile/${currentUser.Id}`);
        }, 2000);
      } else {
        setMessage(result.message || 'Failed to post complaint. Please try again.');
      }
    } catch (error) {
      console.error('Error posting complaint:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="container">
        <div className="row justify-content-center mt-5">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Access Denied</h4>
              <p>Please log in to post a complaint.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/signup')}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className="row justify-content-center mt-5">
        <div className="col-lg-8 col-md-8 col-sm-10">
          <div className="card shadow">
            <div className="card-title text-center border-bottom">
              <div className="d-flex justify-content-between align-items-center p-3">
                {/* Back button */}
                <Link 
                  to={`/student-profile/${studentId || currentUser.Id}`} 
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Back to Profile
                </Link>
                
                <h2 className="mb-0" style={{ color: "goldenrod" }}>
                  Write a Complaint
                </h2>
                
                {/* Empty div for spacing */}
                <div></div>
              </div>
            </div>
            <div className='card-body bg-light'>
              <form onSubmit={handleSubmit(postComplaint)}>
                {/* Title */}
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">Title*</label>
                  <input 
                    type="text" 
                    className='form-control' 
                    id="title" 
                    {...register("title", { 
                      required: "Title is required",
                      maxLength: { value: 100, message: "Title must be less than 100 characters" }
                    })}
                    placeholder="Enter a brief title for your complaint"
                  />
                  {errors.title && <p className="text-danger small">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div className='mb-4'>
                  <label htmlFor="content" className='form-label'>Description*</label>
                  <textarea 
                    {...register("content", { 
                      required: "Description is required",
                      maxLength: { value: 500, message: "Description must be less than 500 characters" }
                    })} 
                    id="content" 
                    className='form-control' 
                    rows="4"
                    placeholder="Describe your complaint in detail..."
                  ></textarea>
                  {errors.content && <p className="text-danger small">{errors.content.message}</p>}
                </div>

                {/* Category */}
                <div className='mb-4'>
                  <label htmlFor="category" className="form-label">Select a category*</label>
                  <select 
                    {...register("category", { required: "Category is required" })} 
                    id="category" 
                    className="form-select"
                  >
                    <option value="">Select a category</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Furniture">Furniture</option>
                    <option value="WiFi">WiFi</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <p className="text-danger small">{errors.category.message}</p>}
                </div>

                {/* Other category specification - only show when "other" is selected */}
                {watchCategory === 'other' && (
                  <div className="mb-4">
                    <label htmlFor="other" className="form-label">Please specify the category*</label>
                    <input 
                      type="text" 
                      className='form-control' 
                      id="other" 
                      {...register("other", {
                        required: watchCategory === 'other' ? "Please specify the category" : false
                      })}
                      placeholder="Specify the category"
                    />
                    {errors.other && <p className="text-danger small">{errors.other.message}</p>}
                  </div>
                )}

                {/* Room Number */}
                <div className="mb-4">
                  <label htmlFor="roomno" className="form-label">Room No</label>
                  <input 
                    type="number" 
                    className='form-control' 
                    id="roomno" 
                    {...register("roomno", {
                      valueAsNumber: true,
                      min: { value: 1, message: "Room number must be positive" }
                    })}
                    defaultValue={currentUser.roomNumber}
                    placeholder={`Current: ${currentUser.roomNumber || 'Not set'}`}
                  />
                  {errors.roomno && <p className="text-danger small">{errors.roomno.message}</p>}
                </div>

                {/* Block */}
                <div className="mb-4">
                  <label htmlFor="block" className="form-label">Block</label>
                  <input 
                    type="text" 
                    className='form-control' 
                    id="block" 
                    {...register("block")}
                    defaultValue={currentUser.block}
                    placeholder={`Current: ${currentUser.block || 'Not set'}`}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between">
                  <Link 
                    to={`/student-profile/${studentId || currentUser.Id}`}
                    className="btn btn-secondary"
                  >
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </Link>
                  
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Posting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-1"></i>
                        Post Complaint
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Message display */}
              {message && (
                <div className={`mt-4 p-3 rounded ${message.includes('successfully') ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                  <div className="d-flex align-items-center">
                    <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                    {message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;
