import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useHistory } from 'react-router-dom';

const NewProject = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const { createProject } = useProjects();
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject({ title, description });
            history.push('/dashboard');
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    return (
        <div className="new-project">
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Project Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description">Project Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Project</button>
            </form>
        </div>
    );
};

export default NewProject;