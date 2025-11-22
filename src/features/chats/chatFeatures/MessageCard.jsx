const MessageCard = ({ image, video, title, body, date, time, phone, note, footer }) => {
    return (
      <div className="bg-white border border-gray-200 shadow-md rounded-xl w-full max-w-sm">
        {video ? (
          <video controls className="w-full h-36 object-cover rounded-t-xl">
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          image && (
            <img
              src={image}
              alt="Message"
              className="w-full h-36 object-cover rounded-t-xl"
            />
          )
        )}
        <div className="p-4 text-sm text-gray-800 space-y-2">
          {title && <h4 className="font-semibold text-black">{title}</h4>}
          {body && <p>{body}</p>}
          {date && (
            <p>
              Date: <span className="font-medium">{date}</span>
            </p>
          )}
          {time && (
            <p>
              Time: <span className="font-medium">{time}</span>
            </p>
          )}
          {phone && (
            <p>
              If you have any questions, contact us at{" "}
              <a
                href={`tel:${phone}`}
                aria-label={`Call ${phone}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {phone}
              </a>
            </p>
          )}
          {note && <p className="text-gray-500">{note}</p>}
          {footer && <p className="text-gray-500">{footer}</p>}
        </div>
      </div>
    );
  };
  
  export default MessageCard;
  