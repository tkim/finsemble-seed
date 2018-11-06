// import Draggable, { DraggableCore } from "react-draggable"; // Both at the same time

class DashboardCanvas extends React.Component {
	constructor() {
	  super();
	  this.state = {
		containerId: "",
		children: []
	  };
	}
  
	componentDidMount = async () => {
	  await this.setState({
		containerId: ReactDOM.findDOMNode(this)
	  });
  
	  console.log(document.getElementById(this.state.containerId.childNodes[0].getAttribute("id")).offsetWidth);
	};
	handleChange = e => {
	  console.log("here i am");
	  console.log(e);
	};
  
	render() {
	  return (
		<div className="wrap">
		  <div className="resize both" id="234">
			height {this.state.containerId.offsetHeight}
			<br />
			width {this.state.containerId.offsetWidth}
		  </div>
		</div>
	  );
	}
  }
  ReactDOM.render(<DashboardCanvas />, document.getElementById("root"));
  