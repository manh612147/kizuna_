import React, { useState } from 'react';
import { assets } from '../assets/admin_assets/assets';
import { backendUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null]);
  const [name, setName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [importPrice, setImportPrice] = useState("");
  const [category, setCategory] = useState("gaubong");
  const [stock, setStock] = useState("");
  const [discount, setDiscount] = useState("");
  const [status, setStatus] = useState("Còn hàng");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("productCode", productCode);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("importPrice", importPrice);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("discount", discount);
      formData.append("status", status);

      images.forEach((image, index) => {
        if (image) {
          formData.append(`image${index + 1}`, image);
        }
      });

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setName('');
        setProductCode('');
        setDescription('');
        setPrice('');
        setImportPrice('');
        setStock('');
        setDiscount('');
        setStatus('Còn hàng');
        setImages([null, null, null, null]);

      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col w-full items-start gap-3'
    >

      {/* Tải ảnh */}
      <div>
        <p className='mb-2'>Tải ảnh lên</p>

        <div className='flex gap-2'>
          {images.map((image, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>

              <img
                className='w-20'
                src={
                  image
                    ? URL.createObjectURL(image)
                    : assets.upload_area
                }
                alt=""
              />

              <input
                onChange={(e) => {
                  const newImages = [...images];
                  newImages[index] = e.target.files[0];
                  setImages(newImages);
                }}
                type="file"
                id={`image${index + 1}`}
                hidden
              />

            </label>
          ))}
        </div>
      </div>

      {/* Tên sản phẩm */}
      <div>
        <p className='w-full'>Tên sản phẩm</p>

        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2'
          type="text"
          placeholder='Nhập tên sản phẩm'
          required
        />
      </div>

      {/* Mã sản phẩm */}
      <div>
        <p className="w-full">Mã sản phẩm</p>

        <input
          type="text"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Ví dụ: VT001"
          required
        />
      </div>

      {/* Mô tả */}
      <div>
        <p className='w-full'>Mô tả sản phẩm</p>

        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2'
          placeholder='Nhập mô tả sản phẩm'
          required
        />
      </div>

      {/* Danh mục */}
      <div>
        <p className='mb-2'>Danh mục sản phẩm</p>

        <select
          onChange={(e) => setCategory(e.target.value)}
          value={category}
          className='w-full px-3 py-2'
        >
          <option value="gaubong">Gấu bông</option>
          <option value="hoa">Hoa</option>
          <option value="vongtay">Vòng tay</option>
          <option value="mockhoa">Móc khóa</option>
        </select>
      </div>

      {/* Giá bán */}
      <div>
        <p className='mb-2'>Giá sản phẩm</p>

        <input
          onChange={(e) => setPrice(e.target.value)}
          value={price}
          className='w-full px-3 py-2'
          type="number"
          placeholder='Nhập giá sản phẩm'
          required
        />
      </div>

      {/* Trạng thái */}
      <div>
        <p className='mb-2'>Trạng thái sản phẩm</p>

        <select
          onChange={(e) => setStatus(e.target.value)}
          value={status}
          className='w-full px-3 py-2'
        >
          <option value="Còn hàng">Còn hàng</option>
          <option value="Hết hàng">Hết hàng</option>
        </select>
      </div>

      {/* Giảm giá */}
      <div>
        <p className='mb-2'>Giảm giá (%)</p>

        <input
          onChange={(e) => setDiscount(e.target.value)}
          value={discount}
          className='w-full px-3 py-2'
          type="number"
          placeholder='Nhập % giảm giá'
        />
      </div>

      {/* Số lượng */}
      <div>
        <p className='mb-2'>Số lượng sản phẩm</p>

        <input
          onChange={(e) => setStock(e.target.value)}
          value={stock}
          className='w-full px-3 py-2'
          type="number"
          placeholder='Nhập số lượng'
          required
        />
      </div>

      {/* Giá vốn */}
      <div>
        <p className='mb-2'>Giá vốn đầu vào</p>

        <input
          onChange={(e) => setImportPrice(e.target.value)}
          value={importPrice}
          className='w-full px-3 py-2'
          type="number"
          placeholder='Nhập giá vốn'
          required
        />
      </div>

      {/* Nút thêm */}
      <button
        type='submit'
        className='w-28 py-3 mt-4 bg-black text-white'
      >
        THÊM
      </button>

    </form>
  );
};

export default Add;