# Install-lammps-with-python-using-conda
Here we use traditional `make` build system to build LAMMPS and include additional packages like REPLICA etc. Below are detailed steps to build LAMMPS using make within your Conda environment, including the MEAM package and setting up the LAMMPS Python module for parallel computing.

## 1. Create and Activate the Conda Environment
Open a terminal and create a new Conda environment named lammps with Python 3.9:
```bash
conda create -n lammps python=3.13
```
Activate the environment:
```bash
conda activate lammps
```

## 2. Install Necessary Dependencies
Install the required packages within the lammps environment:
```bash
conda install -c conda-forge cmake openmpi mpi4py
conda install -c conda-forge numpy boost pybind11
conda install -c conda-forge fftw compilers libblas 
conda install -c conda-forge liblapack gfortran blas lapack
```

## 3. Download LAMMPS Source Code
Navigate to a directory where you want to download the LAMMPS source code and clone the repository:
```bash
git clone -b stable https://github.com/lammps/lammps.git
cd lammps
```
## 4.1 (Using cmake) Enable the Desired Packages
Create a `build` directory:
```bash
mkdir build; cd build    # create and use a build directory
cmake ../cmake           # configuration reading CMake scripts from ../cmake
```
If you need to enable any other packages, you need:
```bash
cmake ../cmake -D PKG_KSPACE=yes -D PKG_MC=yes -D PKG_MANYBODY=yes -D PKG_MISC=yes -D PKG_REPLICA=yes -D PKG_RIGID=yes -D PKG_MEAM=yes
```

## 4.2 (Using make) Enable the Desired Packages
Navigate to the `src` directory:
```bash
cd src
```
Enable the REPLICA package and any other packages you need:
```bash
make yes-KSPACE yes-MC yes-MANYBODY yes-MISC yes-REPLICA yes-RIGID yes-MEAM
```

## 5. Build LAMMPS as a Shared Library
Build LAMMPS as a shared library with MPI support:
```bash
make mpi mode=shlib -j8
or
cmake -D BUILD_SHARED_LIBS=yes
cmake --build . -j10
```
Potential Output:

The build process may take several minutes. Watch for any errors related to missing libraries or compilation issues. If errors occur, review the `Makefile` for correct paths and ensure all dependencies are installed.

## 6. Verify the Shared Library
After a successful build, confirm that `liblammps.so` exists in the `src` directory:
```bash
ls liblammps.so
```
You should see:
```bash
liblammps.so
```

## 7. Install the LAMMPS Python Module
Compile LAMMPS with either CMake or the traditional make procedure in shared mode. After compilation has finished, type (in the compilation folder):
```bash
make install-python
```

## 8. Test lammps-python
Ensure that the Conda environment can locate the LAMMPS shared library and Python module.
### (a) Verify the Python Installation
Test if the lammps Python module is correctly installed and can be imported:
```bash
python -c "from lammps import lammps; print('LAMMPS module imported successfully')"
```
Expected Output:
```bash
LAMMPS module imported successfully
```

### (b) Test Parallel Computing with LAMMPS in Python
Navigate to Your Working Directory:
```bash
mkdir -p ~/temp
cd ~/temp
```
Create a file named `test_basic.in` with the following content:
```lammps
# test_basic.in
units metal
atom_style atomic
boundary p p p

# Create a simple simulation box
lattice fcc 3.52
region box block 0 10 0 10 0 10
create_box 1 box
create_atoms 1 box

# Define mass
mass 1 63.546

# Define a simple pair style and coefficients
pair_style lj/cut 2.5
pair_coeff 1 1 0.01034 3.40

# Initialize simulation
run 0
```
Create a file named `test_basic.py` with the following content:
```python
# test_basic.py
from lammps import lammps

# Initialize LAMMPS
lmp = lammps()

# Execute the input script
lmp.file('test_basic.in')

print("LAMMPS simulation executed successfully.")
```
Run the script using `mpirun` to utilize multiple processes. For example, to use 4 processes:
```bash
mpirun -np 4 python test_basic.py
```
You should see output similar to the following:
```bash
LAMMPS (29 Aug 2024 - Update 1)
LAMMPS simulation executed successfully.
Total wall time: 0:00:00
```











