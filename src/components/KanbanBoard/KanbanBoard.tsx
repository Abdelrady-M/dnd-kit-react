import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { PlusIcon } from "../../icons/icons";
import { Column, Id } from "../../types";
import ColumnContainer from "../ColumnContainer";

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map(col => col.id), [columns]);
  const [activeColumn, setActiveColumn] = useState<Column | null>();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
  );
  return (
    <>
      <div
        className=" m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="flex mx-auto gap-4">
            <div className="flex gap-4">
              <SortableContext items={columnsId}>
                {columns.map(col => (
                  <ColumnContainer
                    column={col}
                    key={col.id}
                    deleteColumn={deleteColumn}
                  />
                ))}
              </SortableContext>
            </div>
            <button
              onClick={() => createNewColumn()}
              className="
         h-[60px]
         w-[350px]
         min-w-[350px]
         cursor-pointer
         rounded-lg
       bg-mainBackgroundColor
         border-2
       border-columnBackgroundColor
         p-4
       ring-rose-500
         hover:ring-2
         flex
         gap-2
        ">
              <PlusIcon />
              Add Column
            </button>
          </div>
          {createPortal(
            <DragOverlay>
              {activeColumn && (
                <ColumnContainer
                  column={activeColumn}
                  deleteColumn={deleteColumn}
                />
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
    </>
  );

  function createNewColumn() {
    const newColumn: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };
    setColumns([...columns, newColumn]);
  }
  function deleteColumn(id: Id) {
    const filterColumns = columns.filter(col => col.id !== id);
    setColumns(filterColumns);
  }
  function generateId() {
    return Math.floor(Math.random() * 10000);
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeColumnId = active.id;
    const overColumnId = over.id;
    if (activeColumnId === overColumnId) return;
    setColumns(columns => {
      const activeIndex = columns.findIndex(col => col.id === activeColumnId);
      const overIndex = columns.findIndex(col => col.id === overColumnId);

      return arrayMove(columns, activeIndex, overIndex);
    });
  }
}
