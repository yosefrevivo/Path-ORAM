

import './Bear.css';

function Bear() {

  return (
    <>
      <div className="container">
      <div className="bear">
        <div className="bear__ears">
          <div className="bear__ears__left ear"></div>
          <div className="bear__ears__right ear"></div>
        </div>
        <div className="bear__body">
          <div className="bear__eyes">
            <div className="bear__eyes--left eye"></div>
            <div className="bear__eyes--right eye"></div>
          </div>
          <div className="bear__nose">
            <div className="bear__nose--inner"></div>
          </div>
        </div>
      </div>
      <div className="shadow"></div>
    </div>
    </>
  );
}

export default Bear;