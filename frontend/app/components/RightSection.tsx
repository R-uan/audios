import { useQueueContext } from "../context/QueueContext";
import style from "./RightSection.module.scss";

export function RightSection() {
  const queueContext = useQueueContext();

  return (
    <section className={style.section}>
      <header>
        <div>
          <h3>Queue</h3>
        </div>
        <div>
          <button>S</button>
          <button>C</button>
        </div>
      </header>
      <div>
        <div className={style.queueListWrapper}>
          <ul className={style.queueList}>
            {queueContext.queue.map((audio) => {
              return (
                <li className={style.queueItem} key={`queue.${audio.id}`}>
                  <div>
                    <span>
                      {audio.title.length <= 45
                        ? audio.title
                        : `${audio.title.slice(0, 43)}...`}
                    </span>
                  </div>
                  <div>
                    <span>{audio.artist}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
