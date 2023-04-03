import React, { Fragment, useEffect, useState } from "react";
import { CopyBlock, dracula } from "react-code-blocks";
import { SettingOutlined } from "@ant-design/icons";
import {
  Input,
  Row,
  Col,
  Button,
  Space,
  Divider,
  Tooltip,
  Modal,
  Spin,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { uuid } from "uuidv4";
import axios from "@/axios";

export function HtmlInjectionModal(props) {
  const [list, setList] = useState([]);

  const dispatch = useDispatch();

  async function getList() {
    dispatch({ type: "TOGGLE_LOADING", isLoading: true });
    const res = await axios({ method: "GET", url: "/api/list" });

    const data = res?.data || [];
    setList(data.map((obj) => ({ ...obj, key: obj._id })));
    dispatch({ type: "TOGGLE_LOADING", isLoading: false });
  }

  async function onUpdate() {
    dispatch({ type: "TOGGLE_LOADING", isLoading: true });
    const res = await axios({
      method: "PUT",
      url: "/api/list",
      data: list,
    });

    await getList();
    dispatch({ type: "TOGGLE_LOADING", isLoading: false });

    window.location.reload();
  }

  async function onDelete(obj) {
    const temp = list.reduce((prev, curr) => {
      if (obj.key === curr.key) {
        return prev;
      }
      return [...prev, curr];
    }, []);
    setList(temp);
  }

  async function onAddItem(obj) {
    setList([...list, { value: "", key: uuid() }]);
  }

  async function onChange(value, obj) {
    const temp = list.map((o) => {
      if (obj.key === o.key) {
        return { ...o, value };
      }
      return o;
    });
    setList(temp);
  }

  return (
    <Modal
      width={"80%"}
      centered
      //   onCancel={() => setIsOpen(false)}
      //   open={isOpen}
      {...props}
      footer={
        <Button type="primary" onClick={() => onUpdate()}>
          套用
        </Button>
      }
    >
      <h2>貼上程式碼區塊</h2>
      <h3>當前生效程式碼</h3>
      <Space direction="vertical" size="middle" style={{ display: "flex" }}>
        <CopyBlock
          language={"html"}
          text={htmlInjection}
          showLineNumbers
          theme={dracula}
          wrapLines={true}
          codeBlock
        />
      </Space>
      <Divider />

      <h3>請貼上程式碼</h3>
      {list.map((obj, idx) => {
        return (
          <Row
            key={obj.key}
            align="middle"
            gutter={[16, 16]}
            style={{ display: "flex", flexWrap: "nowrap", marginBottom: 16 }}
          >
            {/* <Col sm={1}>{idx}</Col> */}
            <Col
              style={{
                flex: "0 100%",
              }}
            >
              <Input.TextArea
                value={obj.value}
                onChange={(e) => onChange(e?.target?.value, obj)}
                style={{ width: "100%" }}
                autoSize
              />
            </Col>
            <Col>
              <Space
                size="small"
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  justifyContent: "flex-end",
                }}
              >
                <Button type="danger" onClick={() => onDelete(obj)}>
                  刪除
                </Button>
              </Space>
            </Col>
          </Row>
        );
      })}
      <Button
        type="primary"
        onClick={() => onAddItem()}
        style={{ width: "100%" }}
      >
        新增
      </Button>
    </Modal>
  );
}

export default HtmlInjectionModal;