import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import MainHeader from '../components/MainHeader';

const StudentDocuments = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all pending students
    const fetchPendingStudents = async () => {
        try {
            setLoading(true);
            setError('');

            const studentsRef = ref(database, 'application/pending');
            const snapshot = await get(studentsRef);

            if (snapshot.exists()) {
                const studentsData = snapshot.val();
                const studentsArray = Object.keys(studentsData).map(uid => ({
                    uid,
                    ...studentsData[uid]
                }));
                setStudents(studentsArray);
            } else {
                setStudents([]);
            }
        } catch (err) {
            setError('Failed to fetch students: ' + err.message);
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch documents for a specific student using your API
    const fetchStudentDocuments = async (studentUid) => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `https://ehlazeni-student-documents-upload-api.onrender.com/get-documents?uid=${studentUid}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch documents');
            }

            const data = await response.json();

            if (data.success) {
                setDocuments(data.data);
                setSelectedStudent(studentUid);
            } else {
                throw new Error(data.error || 'Failed to fetch documents');
            }
        } catch (err) {
            setError('Failed to fetch documents: ' + err.message);
            console.error('Error fetching documents:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredStudents = students.filter((student) => {
        const q = searchQuery.toLowerCase();
        return (
            student.firstName?.toLowerCase().includes(q) ||
            student.lastName?.toLowerCase().includes(q) ||
            student.email?.toLowerCase().includes(q) ||
            student.studentCode?.toLowerCase().includes(q)
        );
    });




    useEffect(() => {
        fetchPendingStudents();
    }, []);

    

    return (

        <>
            <MainHeader />
            <div className="p-6 max-w-6xl mx-auto">

                <h1 className="text-2xl font-bold mb-6 text-gray-800">Student Documents</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">Pending Applications</h2>

                        <input
                            type="text"
                            placeholder="Search by name, email, or student code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full mb-4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        />

                        {loading && students.length === 0 ? (
                            <div className="text-center py-4">Loading students...</div>
                        ) : students.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No pending applications found</div>
                        ) : (
                            <div className="space-y-3">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.uid}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedStudent === student.uid
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => fetchStudentDocuments(student.uid)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {student.firstName} {student.lastName}
                                                </h3>
                                                <p className="text-sm text-gray-600">{student.email}</p>
                                                <p className="text-sm text-gray-500">
                                                    Student Code: {student.studentCode}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Applied: {new Date(student.applicationDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                {student.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Documents Display */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-lg font-semibold mb-4 text-gray-700">
                            {selectedStudent ? 'Student Documents' : 'Select a Student'}
                        </h2>

                        {loading && selectedStudent ? (
                            <div className="text-center py-4">Loading documents...</div>
                        ) : documents ? (
                            <div className="space-y-6">
                                {/* Student Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2">Student Information</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Name:</span>{' '}
                                            {documents.firstName} {documents.lastName}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">ID Number:</span> {documents.idNumber}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Email:</span> {documents.email}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Phone:</span> {documents.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                                    <div className="space-y-4">
                                        {documents.documents && Object.entries(documents.documents).map(([type, url]) => {
                                            const meta = documents.documentsMeta?.[type];
                                            const documentTypes = {
                                                studentIdCopy: 'Student ID Copy',
                                                previousResults: 'Previous School Results',
                                                guardianIdCopy: 'Guardian ID Copy'
                                            };

                                            return (
                                                <div key={type} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {documentTypes[type] || type}
                                                            </h4>
                                                            {meta && (
                                                                <p className="text-sm text-gray-600">
                                                                    Original: {meta.originalName} • {formatFileSize(meta.size)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            View Document
                                                        </a>
                                                    </div>

                                                </div>
                                            );
                                        })}

                                        {documents.documentsUploadedAt && (
                                            <p className="text-sm text-gray-500 text-right">
                                                Uploaded: {new Date(documents.documentsUploadedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                {documents.guardian && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-2">Guardian Information</h3>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Name:</span>{' '}
                                                {documents.guardian.firstName} {documents.guardian.lastName}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">ID Number:</span> {documents.guardian.idNumber}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Email:</span> {documents.guardian.email}
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Phone:</span> {documents.guardian.phone}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Select a student to view their documents
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentDocuments;