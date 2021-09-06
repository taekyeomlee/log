import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector, useDispatch } from 'react-redux';

import {
  setKeyword,
  deleteItem,
  restoreItem,
  updateItem,
} from '../../store/action/bookmarkAction';
import BookmarksFolder from './BookmarksFolder';
import BookmarsList from './BookmarksList';
import FormModal from '../ui/FormModal';
import FormBackdrop from '../ui/FormBackdrop';
import MenuModal from '../ui/MenuModal';
import MenuBackdrop from '../ui/MenuBackdrop';
import AlertToast from '../ui/AlertToast';
import classes from './Bookmarks.module.css';

function Bookmarks() {
  const [menuModalIsOpen, setMenuModalIsOpen] = useState(false);
  const [formModalIsOpen, setFormModalIsOpen] = useState(false);
  const [alertToast, setAlertToast] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [deleteData, setDeleteData] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(0);

  const location = useLocation();

  const selected = useSelector((state) => state.bookmark);
  const selectedData = useSelector((state) => state.bookmark.bookmarks);
  const dispatch = useDispatch();

  let filteredBookmarks;

  filteredBookmarks = selectedData.filter((selectedData) =>
    selectedData.title.toLowerCase().includes(selected.keyword)
  );

  const openMenuModalHandler = () => {
    setMenuModalIsOpen(true);
  };

  const closeMenuModalHandler = () => {
    setMenuModalIsOpen(false);
  };

  const openFormModalHandler = () => {
    setFormModalIsOpen(true);
  };

  const closeFormModalHandler = () => {
    setFormModalIsOpen(false);
  };

  const openAlertToastHandler = () => {
    setAlertToast(true);
  };

  const closeAlertToastHandler = () => {
    setAlertToast(false);
  };

  const setMenuModalLocationHandler = (e) => {
    const substring = 'Backdrop';
    if (
      location.pathname === '/bookmarks' &&
      !e.target.className.includes(substring)
    ) {
      e.preventDefault();

      setY(e.nativeEvent.pageY);
      setX(e.nativeEvent.pageX);

      openMenuModalHandler();
    }
  };

  const removeBookmarkHandler = (id) => {
    const data = selectedData.filter((selectedData) => selectedData.id === id);
    const dataIndex = selectedData.findIndex(
      (selectedData) => selectedData.id === id
    );

    setDeleteData(data[0]);
    setDeleteIndex(dataIndex);

    dispatch(deleteItem(id));
    openAlertToastHandler();
  };

  const restoreBookmarkHandler = () => {
    dispatch(restoreItem(deleteIndex, deleteData));
  };

  const moveBookmark = useCallback(
    (dragIndex, hoverIndex) => {
      const dragBookmark = selectedData[dragIndex];
      dispatch(updateItem(dragIndex, hoverIndex, dragBookmark));
    },
    [dispatch, selectedData]
  );

  useEffect(() => {
    dispatch(setKeyword(''));
    if (alertToast) {
      setTimeout(() => setAlertToast(false), 3000);
    }
  }, [dispatch, alertToast]);

  return (
    <div
      className={classes.bookmarks}
      onContextMenu={setMenuModalLocationHandler}
    >
      <BookmarksFolder />
      <DndProvider backend={HTML5Backend}>
        <BookmarsList
          myBookmarks={filteredBookmarks}
          moveBookmark={moveBookmark}
          getDeleteAction={removeBookmarkHandler}
        />
      </DndProvider>
      {menuModalIsOpen && (
        <MenuModal
          type="contextMenu"
          x={x}
          y={y}
          getAddAction={openFormModalHandler}
          onClose={closeMenuModalHandler}
        />
      )}
      {menuModalIsOpen && <MenuBackdrop onClose={closeMenuModalHandler} />}
      {formModalIsOpen && (
        <FormModal type="add" onClose={closeFormModalHandler} />
      )}
      {formModalIsOpen && <FormBackdrop onClose={closeFormModalHandler} />}
      {alertToast && (
        <AlertToast
          title={deleteData.title}
          onClose={closeAlertToastHandler}
          onCancel={restoreBookmarkHandler}
        />
      )}
    </div>
  );
}

export default Bookmarks;
