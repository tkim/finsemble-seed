import React from "react";
import "./dragDrop.css";
export default class Drag extends React.Component {
  dragStart = event => {
    event.dataTransfer.setData("text/plain", event.target.id);
  };
  allowDrop = event => {
    event.preventDefault();
    event.currentTarget.style.background = "#7f8082";
  };
  drop = event => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
	const element = document.querySelector(`#${data}`);
    event.currentTarget.style.background = "white";
    try {
      event.target.appendChild(element);
    } catch (error) {
      console.warn("you can't move the item to the same place");
    }
  };
  render() {
    return (
      <div className="container">
        <div className="droppable">
          <div id="list" className="list" draggable="true" ondragstart="dragStart(event)">
            <div className="heading">
              <h4 className="list-title">List Heading</h4>
            </div>
            <div className="cards">
              <div className="list-card">
                <p>Card title</p>
                <span className="js-badges">
                  <div className="badge is-complete">
                    <span className="badge-icon">
                      <i className="ion-android-checkbox-outline fa-lg pr-1" />
                    </span>
                    <span className="badge-text">7/7</span>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="droppable" onDragOver={this.allowDrop} onDrop={this.drop} data="hello" />
        <div className="droppable" onDragOver={this.allowDrop} onDrop={this.drop} />
        <div className="droppable" onDragOver={this.allowDrop} onDrop={this.drop} />
        <div className="droppable" onDragOver={this.allowDrop} onDrop={this.drop} />
      </div>
    );
  }
}
