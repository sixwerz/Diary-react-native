export default interface WidgetTrashNotesProps {
  returnNote(noteId: number): void;
  handleClose(): void;
  visible: boolean;
}