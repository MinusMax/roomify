import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock} from "lucide-react";
import Button from "../../components/ui/Button";
import {Layers} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate} from "react-router";
import {useEffect, useState , useRef} from "react";
import {createProject, getProjects} from "../../lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);

    useEffect(() => {
        const fetchProjects = async () => {
            const data = await getProjects();
            setProjects(data);
        };
        fetchProjects();
    }, []);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUploadComplete = async (base64Data: string) => {
        try {
            if (isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const newId = crypto.randomUUID();
            const name = `Residence ${newId}`;

            const newItem = {
                id: newId, name, sourceImage: base64Data, renderedImage: undefined,
                timestamp: Date.now()
            }

            const saved = await createProject({item: newItem, visibility: 'private'});

            if (!saved) {
                console.error('Failed to create project');
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualizer/${saved.id}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRender: saved.renderedImage || null,
                    name: saved.name
                }
            });
            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }

  return (
      <div className="home">
        <Navbar />

          <section className="hero">
              <div className="announce">
                  <div className="dot">
                      <div className="pulse"></div>
                  </div>

                  <p>Introducing Roomify 2.0</p>
              </div>

              <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

              <p className="subtitle">
                  Roomify is an AI-first design environment that helps you visualize, render and ship architectural projects faster than ever.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Start Building <ArrowRight className="icon" />
                  </a>

                  <Button variant="outline" size="lg" className="demo">
                      Watch Demo
                  </Button>
              </div>

              <div id="upload" className="upload-shell">
                  <div className="grid-overlay"/>
                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon"/>
                          </div>

                          <h3>Upload your floor plan</h3>
                          <p>Supports JPG, PNG, and WebP formats up to 50MB</p>
                      </div>

                      <Upload onComplete={handleUploadComplete}/>
                  </div>
              </div>
          </section>

          <section className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Project</h2>
                          <p>Your latest work and shared community projects, all in one place.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id , name , renderedImage , sourceImage , timestamp}) => (
                          <div className="project-card group" key={id} onClick={() => navigate(`/visualizer/${id}`)}>
                          <div className="preview">
                          <img src={renderedImage || sourceImage} alt="Project" />

                          <div className="badge">
                          <span>Community</span>
                          </div>
                          </div>

                          <div className="card-body">
                          <div>
                          <h3>{name}</h3>

                          <div className="meta">
                          <Clock size={12} />
                  <span>{mounted ? new Date(timestamp).toLocaleDateString() : ""}</span>
                  <span>By Max</span>
              </div>
      </div>
    <div className="arrow">
        <ArrowUpRight size={18} />
    </div>
</div>

</div>
                      ))}

                  </div>

              </div>
          </section>
      </div>
  )
}
