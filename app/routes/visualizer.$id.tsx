import {useLocation, useParams} from "react-router";

const VisualizerId = () => {
    const { id } = useParams();
    const location = useLocation();
    const image = location.state?.image;

    return (
        <div>
            <h1>Visualizer: {id}</h1>
            {image && <img src={image} alt="Uploaded Floor Plan" style={{ maxWidth: '100%' }} />}
        </div>
    )
}
export default VisualizerId
