import { LineWave } from "react-loader-spinner";

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-5">
      <LineWave
        visible={true}
        height="100"
        width="100"
        color="#3B82F6" 
        ariaLabel="line-wave-loading"
        firstLineColor="#3B82F6"
        middleLineColor="#2563EB"
        lastLineColor="#1D4ED8"
      />
    </div>
  );
};

export default Loader;