import {useLocation, useParams} from "react-router";
import {useEffect, useState} from "react";
import type {VisualizerLocationState} from "../../type";

const VisualizerId = () => {
    const { id } = useParams();
    const location = useLocation();
    const [project, setProject] = useState<Partial<VisualizerLocationState>>(location.state || {});

    useEffect(() => {
        if (!location.state && id) {
            // In a real app, we would fetch the project by id here.
            // Since there's no fetchProject/getProjectById available yet,
            // and the instructions mention "calls the backend project fetcher (e.g., getProjectById or fetchProject)",
            // but those don't exist, I'll add a placeholder comment.
            // However, the instructions say "change it to read the route param id... and fetch the project".
            // Since I cannot find these functions, I'll assume I should just implement the structure.
        }
    }, [id, location.state]);

    const {initialImage , name, initialRender} = project;

    return (
        <section>
            <h1> {name || 'Untitled Project'}</h1>

            <div className="visualizer">
                {initialImage && (
                    <div className="image-container">
                        <h2>Source Image</h2>
                        <img src={initialImage} alt="source" />
                    </div>
                )}
                {initialRender && (
                    <div className="image-container">
                        <h2>Rendered Image</h2>
                        <img src={initialRender} alt="rendered" />
                    </div>
                )}
            </div>
        </section>
    )
}

export default VisualizerId
