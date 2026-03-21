import {useLocation, useNavigate, useParams} from "react-router";
import {useEffect, useState, useRef} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, X, Download, Share2 , RefreshCcw} from "lucide-react";
import Button from "../../components/ui/Button";
import {createProject, getProjectById} from "../../lib/puter.action";

const VisualizerId = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const {initialImage , name: initialName, initialRender} = location.state || {};

    const hasInitialGenerated = useRef(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null);
    const [projectName, setProjectName] = useState(initialName || 'Untitled Project');
    const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);

    const handleBack = () => navigate('/');

    useEffect(() => {
        const loadProject = async () => {
            if (!id) return;
            if (initialImage) return; // Already have data from state

            const project = await getProjectById({ id });
            if (project) {
                setProjectName(project.name || 'Untitled Project');
                setSourceImage(project.sourceImage);
                if (project.renderedImage) {
                    setCurrentImage(project.renderedImage);
                }
            }
        };
        loadProject();
    }, [id, initialImage]);

    const runGeneration = async () => {
        const imgToUse = sourceImage || initialImage;
        if(!imgToUse) return;

        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: imgToUse });

            if(result.renderedImage) {
                setCurrentImage(result.renderedImage);

                // Update project with rendered image
                if (id) {
                    await createProject({
                        item: {
                            id,
                            name: projectName,
                            sourceImage: imgToUse,
                            renderedImage: result.renderedImage,
                            timestamp: Date.now()
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to generate 3D view:', error);
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        const imgToUse = sourceImage || initialImage;
        if(!imgToUse || hasInitialGenerated.current) return;

        if(initialRender || currentImage) {
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        runGeneration();
    }, [sourceImage, initialImage, initialRender]);


    return (
            <div className="visualizer">
                <nav className="topbar">
                    <div className="brand">
                        <Box  className="logo" />

                        <span className="name">
                            Roomify
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                        <X className="icon" /> Exit Editor
                    </Button>
                </nav>

                <section className="content">
                    <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{projectName}</h2>
                            <p className="note">Created by You</p>
                        </div>

                        <div className="panel-actions">
                            <Button
                                size="sm"
                                onClick={() => {}}
                                className="export"
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2"/> Export
                            </Button>
                            <Button size="sm" onClick={() => {}} className="share">
                                <Share2 className="w-4 h-4 mr-2"/> Share
                            </Button>
                        </div>
                    </div>

                        <div className={`render-area ${isProcessing ? 'is-processing' : ''}`} >
                            {currentImage ? (
                                <img src={currentImage} alt="AI Render" className="render-img" />
                            ) : (
                                <div className="render-placeholder">
                                    {(sourceImage || initialImage) && (
                                        <img src={sourceImage || initialImage} alt="Original" className="render-fallback" />
                                    )}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
                                        <RefreshCcw className="spinner" />
                                        <span className="title">Rendering ...</span>
                                        <span className="subtitle">Generating your 3D visualization</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </section>
            </div>
    )
}

export default VisualizerId
