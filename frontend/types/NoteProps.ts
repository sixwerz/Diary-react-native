export default interface NoteProps {
  noteId: number;
  noteText: string;
  noteTitle: string;
  noteCreatedAt: string;
  handleDeleteNote?(noteId: number): void;
  returnNote?(): void;
}