const BaseRoute = require("../../base_webhook.js");

const ACTION_PULL   = "pull";
const ACTION_PUSH   = "push";
const ACTION_MOUNT  = "mount";
const ACTION_DELETE = "delete";

class RegistryEvents extends BaseRoute {
  route() {
    return "registry_events";
  }

  method() {
    return "post";
  }

  // WEBHOOK PAYLOAD FORMAT
  // {
  //   "events": [
  //     {
  //       "id: "unique event id",
  //       "timestamp": "time event occurred",
  //       "action": "What type of action triggered event",
  //       "target": {
  //         "mediaType": "describe the type of the content. All text based formats are encoded as utf-8",
  //         "size": "size in bytes of content",
  //         "digest": "uniquely identifies the content. A byte stream can be verified against against this digest.",
  //         "urls": ["uniquely identifies the content. A byte stream can be verified against against this digest"],
  //         "repository": "identifies the named repository",
  //         "fromRepository": "identifies the named repository which a blob was mounted from if appropriate",
  //         "url": "provides a direct link to the content.",
  //         "tag": "provides the tag"
  //       },
  //       "request": {
  //         "id": "uniquely identifies the request that initiated the event",
  //         "addr": "contains the ip or hostname and possibly port of the client connection that initiated the event. This is the RemoteAddr from the standard http request",
  //         "host": "is the externally accessible host name of the registry instance, as specified by the http host header on incoming requests",
  //         "method": "has the request method that generated the event",
  //         "useragent": "contains the user agent header of the request"
  //       },
  //       "actor": {
  //         "name": "subject or username associated with the request context that generated the event",
  //       },
  //       "source": {
  //         "addr": "contains the ip or hostname and the port of the registry node that generated the event. Generally, this will be resolved by os.Hostname() along with the running port.",
  //         "instanceID": "identifies a running instance of an application. Changes after each restart."
  //       }
  //     },
  //     ...
  //   ]
  // }

  async action(req, res) {
    console.log("In action");
    let body = req.body;
    try {
      let promises = [];
      for (let event of body.events) {

        if (!this.isValidTaggedDeployment(event)) {
          return;
        }

        // decompose the repository
        let [deploymentId, componentId] = event.target.repository.split("/");

        let image = `${event.request.host}/${event.target.repository}:${event.target.tag}`;

        promises.push(await this.service("commander").deployComponent(deploymentId, componentId, image));
      }
      await Promise.all(promises);
      return this.ack(res);
    }catch (e) {
      console.log(e);
      throw e;

    }
  }


  isValidTaggedDeployment(event) {
    return event.action === ACTION_PUSH && event.target.tag.length > 0 && event.target.tag !== "latest";
  }
}

module.exports = RegistryEvents;



/*


// Returns if we should deploy based on a given event.
func shouldDeployEvent(ev notifications.Event) bool {
  return ev.Action == notifications.EventActionPush &&
      len(ev.Target.Tag) > 0 && ev.Target.Tag != "latest"
}

// Makes a deployment request to the provisioning service.
func requestDeploy(meta provisioner.DeploymentMetadata, image string) int {
  logger := regLog.WithField("function", "requestDeploy")

  //
  return http.StatusOK
}


 */
/*

// EventAction constants used in action field of Event.
const (
	EventActionPull   = "pull"
	EventActionPush   = "push"
	EventActionMount  = "mount"
	EventActionDelete = "delete"
)



{
  "events": [
    {
      "id: "unique event id",
      "timestamp": "time event occurred",
      "action": "What type of action triggered event",
      "target": {
        "mediaType": "describe the type of the content. All text based formats are encoded as utf-8",
        "size": "size in bytes of content",
        "digest": "uniquely identifies the content. A byte stream can be verified against against this digest.",
        "urls": ["uniquely identifies the content. A byte stream can be verified against against this digest"],
        "repository": "identifies the named repository",
        "fromRepository": "identifies the named repository which a blob was mounted from if appropriate",
        "url": "provides a direct link to the content.",
        "tag": "provides the tag"
      },
      "request": {
        "id": "uniquely identifies the request that initiated the event",
        "addr": "contains the ip or hostname and possibly port of the client connection that initiated the event. This is the RemoteAddr from the standard http request",
        "host": "is the externally accessible host name of the registry instance, as specified by the http host header on incoming requests",
        "method": "has the request method that generated the event",
        "useragent": "contains the user agent header of the request"
      },
      "actor": {
        "name": "subject or username associated with the request context that generated the event",
      },
      "source": {
        "addr": "contains the ip or hostname and the port of the registry node that generated the event. Generally, this will be resolved by os.Hostname() along with the running port.",
        "instanceID": "identifies a running instance of an application. Changes after each restart."
      }
    },
    ...
  ]
}




// TODO(stevvooe): The event type should be separate from the json format. It
// should be defined as an interface. Leaving as is for now since we don't
// need that at this time. If we make this change, the struct below would be
// called "EventRecord".

// Event provides the fields required to describe a registry event.
type Event struct {

	// Target uniquely describes the target of the event.
	Target struct {
		// TODO(stevvooe): Use http.DetectContentType for layers, maybe.

		distribution.Descriptor

		// Length in bytes of content. Same as Size field in Descriptor.
		// Provided for backwards compatibility.
		Length int64 `json:"length,omitempty"`

		// Repository identifies the named repository.
		Repository string `json:"repository,omitempty"`

		// FromRepository identifies the named repository which a blob was mounted
		// from if appropriate.
		FromRepository string `json:"fromRepository,omitempty"`

		// URL provides a direct link to the content.
		URL string `json:"url,omitempty"`

		// Tag provides the tag
		Tag string `json:"tag,omitempty"`
	} `json:"target,omitempty"`


}


var (
	// ErrSinkClosed is returned if a write is issued to a sink that has been
	// closed. If encountered, the error should be considered terminal and
	// retries will not be successful.
	ErrSinkClosed = fmt.Errorf("sink: closed")
)

// Sink accepts and sends events.
type Sink interface {
	// Write writes one or more events to the sink. If no error is returned,
	// the caller will assume that all events have been committed and will not
	// try to send them again. If an error is received, the caller may retry
	// sending the event. The caller should cede the slice of memory to the
	// sink and not modify it after calling this method.
	Write(events ...Event) error

	// Close the sink, possibly waiting for pending events to flush.
	Close() error
}

 */