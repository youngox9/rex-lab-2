import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import * as Icon from "@ant-design/icons";
import {
  Card,
  Empty,
  Divider,
  Input,
  Row,
  Col,
  Button,
  Form,
  Space,
  Popover,
  Select,
  Radio,
  Checkbox,
  Upload,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { uuid } from "uuidv4";
import { Slate, Editable, withReact } from "slate-react";
import { createEditor } from "slate";
import { Swiper, SwiperSlide } from "swiper/react";
import _ from "lodash";
import axios from "@/axios";

import "swiper/css";

import ImageFileUpload from "@/components/ImageFileUpload";

function BlurInput(props = {}) {
  const { value: propsValue, onChange } = props;
  const [value, setValue] = useState(propsValue);

  useEffect(() => {
    setValue(propsValue);
  }, [JSON.stringify(propsValue)]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={(e) => onChange(value)}
      style={{ border: "none" }}
    />
  );
}
export default function FormList({ list: propsList = [] }) {
  const [list, setList] = useState(propsList);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();

  async function onUpdate(newList) {
    await axios({
      method: "PUT",
      url: "/api/gallery/list",
      data: newList,
    });
  }

  function onAddItem() {
    const newList = [
      ...list,
      {
        name: `作品-${list.length + 1}`,
        key: uuid(),
        images: [],
        title: "",
        des: [
          {
            type: "paragraph",
            children: [{ text: "A line of text in a paragraph." }],
          },
        ],
      },
    ];
    setList(newList);
    onUpdate(newList);
  }

  function onDeleteItem(item) {
    const newList = list.reduce((prev, curr) => {
      if (item.key === curr.key) {
        return [...prev];
      }
      return [...prev, curr];
    }, []);
    setList(newList);
    onUpdate(newList);
  }

  function onFormNameChange(idx, value) {
    const temp = _.set(list, [idx, "name"], value);
    setList(temp);
    onUpdate(temp);
  }

  function onItemChange(data = {}, item) {
    const newList = list.reduce((prev, curr) => {
      if (curr.key === item.key) {
        return [...prev, data];
      }
      return [...prev, curr];
    }, []);
    setList(newList);
    onUpdate(newList);
  }

  const [editor] = useState(() => withReact(createEditor()));

  return (
    <Fragment>
      <h2>動態表單測試</h2>

      <Space
        style={{
          width: "100%",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Button type="primary" onClick={() => onAddItem()}>
          <Icon.PlusOutlined />
          新增作品
        </Button>
        <Button
          type="danger"
          onClick={() => {
            setList([]);
            onUpdate([]);
          }}
        >
          <Icon.ClearOutlined />
          清除全部
        </Button>
      </Space>

      {list.length ? (
        <Row gutter={[12, 12]}>
          {list.map((item, idx) => {
            const { name } = item;
            return (
              <Col key={item.key} span={6}>
                <div>
                  <Divider />

                  <Card
                    size="small"
                    title={
                      <BlurInput
                        size="small"
                        value={name}
                        onChange={(val) => onFormNameChange(idx, val)}
                      />
                    }
                    extra={
                      <Space
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Button
                          type="danger"
                          shape="circle"
                          size="small"
                          icon={<Icon.DeleteOutlined />}
                          onClick={() => onDeleteItem(item)}
                        />
                      </Space>
                    }
                    style={{ width: "100%" }}
                  >
                    <p>作品圖片</p>
                    {/* <Swiper
                      className="gallery-swiper"
                      spaceBetween={50}
                      slidesPerView={1}
                    >
                      {item.images.map((src, idx) => {
                        return (
                          <SwiperSlide key={idx}>
                            <div className="gallery-item">
                              <Button
                                shape="circle"
                                icon={<Icon.DeleteOutlined />}
                                onClick={() => onRemoveImage(item, idx)}
                              />
                              <img
                                src={src}
                                alt="1"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </SwiperSlide>
                        );
                      })}
                    </Swiper> */}
                    <ImageFileUpload
                      list={list}
                      data={item}
                      onChange={(data) => onItemChange(data, item)}
                    />
                    <Divider />
                    <Slate editor={editor} value={item?.des || []}>
                      {/* <Button icon={<Icon.ClearOutlined />} format="bold" /> */}
                      <Editable />
                    </Slate>
                  </Card>

                  {/* <Button
                    type="primary"
                    htmlType="submit"
                    style={{ width: "100%" }}
                  >
                    Submit
                  </Button> */}
                </div>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty />
      )}
    </Fragment>
  );
}

export async function getServerSideProps(context) {
  const { getData } = require("@/db");
  const list = await getData("gallery");

  return {
    props: {
      list,
    },
  };
}
