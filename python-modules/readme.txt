Conda配置国内镜像源

# 换回默认源（清除所有用户添加的镜像源路径，只保留默认的路径）
conda config --remove-key channels
vim ~/.condarc

.condarc文档内容如下（清华镜像源）：

channels:
  - defaults
show_channel_urls: true
default_channels:
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
  - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
custom_channels:
  conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  msys2: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  bioconda: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  menpo: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud
  simpleitk: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud



其他的镜像源

# 中科大镜像源
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/conda-forge/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/msys2/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/bioconda/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/menpo/
conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/

# 阿里镜像源
conda config --add channels https://mirrors.aliyun.com/pypi/simple/

# 豆瓣的python的源
conda config --add channels http://pypi.douban.com/simple/ 

# 显示检索路径，每次安装包时会将包源路径显示出来
conda config --set show_channel_urls yes

conda config --set always_yes True

# 显示所有镜像通道路径命令
conda config --show channels

   

从国内镜像源下载包

# 更换后面的源路径和需要安装的包名即可
pip install -U pandas -i https://pypi.tuna.tsinghua.edu.cn/simple

pip install -U networkx python-louvain tensorflow-gpu==1.12 -i https://pypi.tuna.tsinghua.edu.cn/simple
